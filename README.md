# Shedule Instance GCE

If you are working with GCE Instances and those don't need to be up all the time you can save money scheduling the on adn off that instances. Using [Cloud Scheduler](https://cloud.google.com/scheduler/docs), [Pub/Sub](https://cloud.google.com/pubsub/docs/overview) and [Cloud Functions](https://cloud.google.com/functions/docs) you can build a simple solution. This repo will help you to understand and deploy it easily. This solution is based in the Google oficial arthicle of this [link](https://cloud.google.com/blog/products/storage-data-transfer/save-money-by-stopping-and-starting-compute-engine-instances-on-schedule).

## Solution Arcchitecture

![](https://storage.googleapis.com/gweb-cloudblog-publish/images/GCP_cloud_scheduler.max-1400x1400.png =626x332)

## Requirements

* Cloud Shell
* Google SDK
* GCP permissions recomended (Editor, Owner).
* Create your instances with labels for example: `env=dev`

## How to deploy

1. Install the [Google SDK](https://cloud.google.com/sdk/docs/quickstarts) in your computer or use the Cloud Shell.
2. Log In in your GCP project.
3. Set the environment variables.

```bash
export PROJECT_ID=myprojectid
export SA_NAME=sa-name
export ZONE=us-central1
```

4. Run the deploy-project file.

```bash
sh deploy.sh
```

5. [Create a Cloud Scheduler Job](https://cloud.google.com/scheduler/docs/quickstart) with the payload.

```text
 {
     "zone":"us-central1-a",
     "label":"env=dev"
 }
```