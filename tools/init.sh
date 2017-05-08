#!/usr/bin/env bash

../tools/cleanup.sh

echo "asd" > t1.txt
echo "dsa" > t2.txt
mkdir f1
echo "qwe" > f1/t3.txt
mkdir f1/f2
echo "ewq" > f1/f2/t4.txt
echo "rty" > f1/f2/t5.txt

node ../src/cli.js init
