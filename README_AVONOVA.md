# Avonova fork

Some of the PRs and issues reported in the public official repository takes time to get into the public release, hence the need for this fork.

## Adaptations

We have modified the original source code for some of our needs. The changes are documented here. All code changes are clearly marked with comment, similar to this:

    // AVONOVA adaptation BEGIN
    ...
    // AVONOVA adaptation END


### Details

* [Home](dev-portal/public/custom-content/content-fragments/Home.md) and [Getting Started](dev-portal/public/custom-content/content-fragments/GettingStarted.md) contents changed to reflect our need.
* Changes to [styles.css][styles.css](dev-portal/public/custom-content/styles.css):
  * **'Try out'** button inside API method doc is hidden (we can not use this for various reasons).
  * Hide Schemas selector (not in use, since we have hidden the 'Try out' button).
  * Hide OPTIONS methods in API UI.
  * Reduced size of API image (original is very large).
* Sorting and grouping of APIs in left API menu panel:
  * Tuned to our requirement (per stage and alphabetical sorting) in [ApisMenu.jsx](dev-portal/src/components/ApisMenu.jsx).
* Show API sections as **_collapsed_** initially
  * Added `docExpansion: 'none'` to Swagger config in [Apis.jsx](dev-portal/src/pages/Apis.jsx).
* Changes to [Apis.jsx](dev-portal/src/pages/Apis.jsx):
  * Show API version for APIs that has a stage (all of our APIs).
  * Remove 'API not subscribable' message (our APIs can not be subscribed to).
* Removed 'Dashboard' menu from top nav bar (we do not use it since our APIs do not have a usage plan)
* Increased memory for catalog-updated Lambda to avoid error that occurs with APIs that have more than a few methods (see this [issue](https://github.com/awslabs/aws-api-gateway-developer-portal/issues/489)) - this interim fix can be removed once the PR for this issue has been merged in the original project.
* Upped access- and ID-token validity to 12 hours (from default 1 hour) in AWS Cognito user pool
  * [index.js](lambdas/cfn-cognito-user-pools-client-settings/index.js)


## Continuous Deployment

We are deploying this project to our https://apidevportal.digital.avonova.com location by using AWS CodePipeline. The pipeline is created (and maintained) by our IaC project.

The [aws folder](aws) in this project contains the necessary AWS build-script and apidevportal deployment configuration.


### Local deployment

If you want to run similar deployment as performed by aws/buildspec.yml from your local workspace,
use the `DEPLOYER_CONFIG` environment variable like this:

    node run install

    DEPLOYER_CONFIG=aws/deployer.config.js node run release

    aws cloudfront create-invalidation --distribution-id E1P4ZB84K2375P --paths "/*"
