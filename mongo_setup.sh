#!/bin/bash
echo "sleeping for 10 seconds"
sleep 10

echo mongo_setup.sh time now: `date +"%T" `
mongo --host mongo0:$PORT <<EOF
  var cfg = {
    "_id": "rs0",
    "version": 1,
    "members": [
      {
        "_id": 0,
        "host": "mongo0:$PORT",
        "priority": 2
      },
      {
        "_id": 1,
        "host": "mongo1:$PORT",
        "priority": 0
      },
      {
        "_id": 2,
        "host": "mongo2:$PORT",
        "priority": 0
      }
    ]
  };
  rs.initiate(cfg);
EOF
