#!/usr/bin/env bash

../tools/init.sh
node ../src/cli.js add t1.txt
node ../src/cli.js commit "c1"
node ../src/cli.js add t2.txt
node ../src/cli.js commit "c2"
