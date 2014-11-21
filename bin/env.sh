#!/bin/bash
for x in $(cat .env); do export $x; done
