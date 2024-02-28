#!/usr/bin/env node
const https = require('https');
const config = require('./config')

/**
 * SLACK's PART
 */

/**
 * SLACK HELPERS
 */
const sendSlackMessage = (filteredJiraTickets) => {
  let message = ''

  filteredJiraTickets.forEach((ticket) => {
    const { status, summary, ticketNumber } = ticket
    message += ` • <${SLACK_TICKET_URI.replace('{ticketNumber}', ticketNumber)}|${ticketNumber}>: ${summary} - *${getJiraStatusWording(status)}*\n`
  })

  const slackBlocks = `[{"type": "section", "text": {"type": "mrkdwn", "text": "${message}"}}]`
  const slackRequestOptions = {
    headers: {
      'Authorization': `Bearer ${config.SLACK_TOKEN}`,
    },
    hostname: 'slack.com',
    method: 'GET',
    path: `/api/chat.postMessage?channel=${config.SLACK_CHANNEL_ID}&blocks=${encodeURI(slackBlocks)}&pretty=1`,
  }
  
  const slackRequest = https.request(slackRequestOptions, (res) => {
    res.setEncoding('utf8');
    res.on('data', (slackAPIResult) => {
      const { error, ok } = JSON.parse(slackAPIResult)
  
      if (ok) {
        console.log("Your update has been sent, enjoy the 30 seconds you've just saved!")
      } else {
        console.log("Something went wrong, you'll have to write your update by hand :(", error)
      }
    })
  })
  slackRequest.end()
}

/**
 * JIRA's PART
 */

/**
 * SLACK VARIABLES
 */
const SLACK_TICKET_URI = 'https://fubotv.atlassian.net/browse/{ticketNumber}'

/**
 * JIRA VARIABLES
 */ 
const JIRA_STATUS_URL = {
  done: 'https://fubotv.atlassian.net/rest/api/3/status/10005',
  onGoing: 'https://fubotv.atlassian.net/rest/api/3/status/3',
  review: 'https://fubotv.atlassian.net/rest/api/3/status/10317',
}


/**
 * JIRA HELPERS
 */ 
const getJiraStatusWording = (statusUrl) => {
  switch(statusUrl) {
    case JIRA_STATUS_URL.onGoing:
      return 'On going'
    case JIRA_STATUS_URL.review:
      return 'In review'

    default:
      return 'On going'
  }
}

const getJiraTickets = async () => {
  const jiraRequest0ptions = {
    auth: `${config.JIRA_USER_MAIL}:${config.JIRA_TOKEN}`,
    hostname: 'fubotv.atlassian.net',
    method: 'GET',
    path: `/rest/api/3/search?jql=assignee%20%3D%20currentUser%28%29%20`, // <= Get all your assigned tickets
  }

  return new Promise((resolve) => {
    const jiraRequest = https.request(jiraRequest0ptions, (res) => {
      let chuncks = ''
      res.setEncoding('utf8');

      res.on('data', (jiraAPIResult) => {
        chuncks += jiraAPIResult
      })

      res.on('end', () => {
        const decodedJiraAPIResult = JSON.parse(chuncks)
        const filteredDecodedJiraAPIResult = []

        decodedJiraAPIResult?.issues?.forEach((issue) => {
          const updateDate = new Date(issue?.fields?.updated).getTime() /* TR => */ + (28 * 1000 * 60 * 60)
          const differenceFromNowInHours = (new Date().getTime() - updateDate) / (1000 * 60 * 60)
  
          if (
            issue?.fields?.status?.self === JIRA_STATUS_URL.onGoing
            || (issue?.fields?.status?.self === JIRA_STATUS_URL.review && differenceFromNowInHours < 24) // <= Include only the last 24 hours tickets in review
          ) {
            filteredDecodedJiraAPIResult.push({
              ticketNumber: issue.key,
              status: issue.fields.status.self,
              summary: issue.fields.summary
            })
          }
        })
  
        resolve(filteredDecodedJiraAPIResult)
      })
    })
    jiraRequest.end()
  })
}

/**
 * MAIN
 */ 
getJiraTickets().then((filteredJiraTickets) => {
  if (filteredJiraTickets.length <= 0) {
    console.log('You have nothing no tickets with updates... Do you really work ?')
    return
  }
  
  sendSlackMessage(filteredJiraTickets)
})
