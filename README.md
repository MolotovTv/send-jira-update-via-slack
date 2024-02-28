# send-jira-update-via-slack

This tool is intended for developers wishing to send a quick overview of their JIRA tickets to SLACK.

This repository contains:

- The script containing the code to retrieve a user's JIRA tickets, only fetching tickets updated within the last 24 hours, and posting them to the desired Slack channel.
- An example configuration file.

## Table of content
 - [Quick start](#quick-start)
   - [Configuration](#configuration)
     - [Jira](#jira)
     - [Slack](#slack)
 - [What are the topics considered as "updated"?](#what-are-the-topics-considered-as-updated)

## Quick start

### Configuration

First of all, you will need to create 2 tokens: One for JIRA, and a second one for SLACK.<br />
Duplicate the file `config.example.js` an rename it `config.js`.<br />
Change the variable `JIRA_USER_MAIL` with your own email address and `SLACK_CHANNEL_ID` with the channel id where updates should be sended.

#### JIRA

This token is very easy to create:
 1. Follow [this link](https://id.atlassian.com/manage-profile/security/api-tokens)
 2. Log in using your Atlassian account (JIRA)
 3. Create an API token
 4. Save your token on the variable `JIRA_TOKEN` set in the file `config.js`

#### SLACK

This token is a bit more difficult to setup:
 1. Follow [this link](https://api.slack.com/apps)
 2. Click on "Create new app" select your team's workspace, and give your app a (simple) name
 3. Then, click on "Permissions", you will be redirected on new page, and choose the "Scopes" section
 4. In the "User token scopes" section add the `chat:write` permission
 5. Click on "Install to workspace" to install your app, and, that's it
 6. Save your token on the variable `SLACK_TOKEN` set in the file `config.js`

Congrat's, your tokens are now setup! You are now ready to use this tool.<br/>
After that, be sure to be able to execute the file (`chmod +x send-jira-update-via-slack.js` if it not the case).

While every thing is setup, you can simply run the command :
```
./send-jira-update-via-slack.js
```


## What are the topics considered as "updated"?

All `on going` tickets must necessarily be on the list of updated tickets; all tickets `in review` that have been updated in the last 24 hours are also on the list of updated tickets.
