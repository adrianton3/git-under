#!/usr/bin/env bash

../tools/init.sh

node ../src/cli.js add t1.txt
node ../src/cli.js commit "c1"

node ../src/cli.js add t2.txt
node ../src/cli.js commit "c2"

node ../src/cli.js branch b1

node ../src/cli.js add f1/t3.txt
node ../src/cli.js add f1/f2/t4.txt
node ../src/cli.js add f1/f2/t5.txt
node ../src/cli.js commit "c3"

