#!/bin/bash

# this script is intended to ensure that all databases have been created on
# the docker mysql instance.

# The MySQL container initializes the DB using .sql files, but only on the first run.
# This script is run on successive runs of the mysql container, therefore ensuring we have the lastest set of DBs

FILE_NAME="init.sql"
MIGRATION_ROOT="$(git rev-parse --show-toplevel)/migrations/setup"
MIGRATION_PATH="${MIGRATION_ROOT}/${FILE_NAME}"
# We must ensure we use the right version of mysql
MYSQL_BIN="docker run --network host --rm mysql:8.0.25"

echo "Creating databases..."
echo "Running migrations from directory ${MIGRATION_ROOT}."
echo "Running ${FILE_NAME}"
$MYSQL_BIN mysql --host=127.0.0.1 --port=3310 --user=root --password='Dev123!!!' < $MIGRATION_PATH
MYSQL_RESULT=$?

if [ $MYSQL_RESULT -eq 0 ]; then
  echo "Databases are up."
else
  echo "Could not ensure that databases are up to date."
  exit 2;
fi;
