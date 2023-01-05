#!/bin/bash

#set -o errexit
#set -o pipefail
#set -o nounset

echo "start"

echo "$(date) Checkpoint 1"
touch /tmp/testfile && echo "Pass" || echo "Fail after checkpoint 1"

sleep 2 
echo "$(date) Checkpoint 2"
echo "$(date) Checkpoint 3"

sleep 2
echo "$(date) Checkpoint 4"
echo "$(date) Checkpoint 5"

sleep 2
echo "$(date) Checkpoint 6"

# Write timestamp into testfile
echo $(date) >> /tmp/testfile

# print out
cat /tmp/testfile

echo "end"