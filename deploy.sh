#!/bin/bash

echo --------------------------------
echo ------------Creating a Service Account
echo --------------------------------
gcloud iam service-accounts create $SA_NAME \
    --description="Service account for shchedule stop and start GCE Instances" \
    --display-name=$SA_NAME

export SA_K8S=$SA_NAME"@"$PROJECT_ID".iam.gserviceaccount.com"

echo --------------------------------
echo ------------Adding permissions to GCE to the Service Account
echo --------------------------------
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SA_K8S --role=roles/compute.admin

echo --------------------------------
echo ------------Creating Pub/Sub Topics
echo --------------------------------
gcloud pubsub topics create stop-instances

gcloud pubsub topics create start-instances

echo --------------------------------
echo ------------Deploying Stop and Start Functions
echo --------------------------------
gcloud functions deploy startInstancePubSub \
--runtime nodejs10 \
--trigger-resource start-instances \
--trigger-event google.pubsub.topic.publish \
--memory 128MB \
--region $ZONE \
--service-account $SA_K8S

gcloud functions deploy stopInstancePubSub \
--runtime nodejs10 \
--trigger-resource stop-instances \
--trigger-event google.pubsub.topic.publish \
--memory 128MB \
--region $ZONE \
--service-account $SA_K8S