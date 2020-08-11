#!/bin/bash

echo --------------------------------
echo ------------Creating a Service Account
echo --------------------------------
gcloud iam service-accounts create $SA_NAME \
    --description="Service account for shchedule stop and start GCE Instances" \
    --display-name=$SA_NAME

export FUNCTION_SA=$SA_NAME"@"$PROJECT_ID".iam.gserviceaccount.com"

echo --------------------------------
echo ------------Adding permissions to GCE to the Service Account
echo --------------------------------
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTION_SA --role=roles/compute.admin

echo --------------------------------
echo ------------Creating Pub/Sub Topic
echo --------------------------------
gcloud pubsub topics create schedule-instances

echo --------------------------------
echo ------------Deploying Function
echo --------------------------------
gcloud functions deploy instanceManagerPubSub \
--runtime nodejs10 \
--trigger-resource schedule-instances \
--trigger-event google.pubsub.topic.publish \
--memory 128MB \
--region $REGION \
--service-account $FUNCTION_SA