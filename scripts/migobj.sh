#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

action=$1

if [[ "$action" == "" ]]; then
  action="get"
fi

if [[ "$action" != "get" ]] && [[ "$action" != "delete" ]]; then
  echo "Action not provided or should be either, get or delete"
  echo "Ex: migobj.sh get"
  exit 1
fi

echo "[MigClusters]"
if [[ "$action" == "get" ]];then
  oc get migclusters
else
  oc delete migclusters $2
fi
echo ""

echo "[Clusters]"
if [[ "$action" == "get" ]];then
  oc get clusters
else
  oc delete clusters --all
fi
echo ""

echo "[Service Account Secret]"
if [[ "$action" == "get" ]];then
  oc get secrets | grep ocp3
else
  oc delete secret $2
fi
echo ""

echo "[MigStorage]"
if [[ "$action" == "get" ]];then
  oc get migstorage
else
  oc delete migstorage --all
fi
echo ""

echo "[AWS Keys Secret]"
if [[ "$action" == "get" ]];then
  oc get secrets | grep aws
else
  oc delete secret $3
fi
echo ""

echo "[MigPlan]"
if [[ "$action" == "get" ]];then
  oc get migplan
else
  oc delete migplan --all
fi
echo ""

echo "[MigMigration]"
if [[ "$action" == "get" ]];then
  oc get migmigration
else
  oc delete migmigration --all
fi
echo ""

