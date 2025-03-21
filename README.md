# telegram-bot

#### local test 
local-config.js mongodb choose the test config
server.js token choose the test token

#### ssh ec2 and update dev bot

$ chmod 400 "aws_quantumkey_ec2.pem"
$ ssh -i "aws_quantumkey_ec2.pem" ec2-user@ec2-54-198-231-203.compute-1.amazonaws.com
$ cd workspace/telegram-bot
$ git pull
$ pm2 restart server

#### logs
$ pm2 logs
or check the log file
$ cd ~/.pm2/logs


pm2 start server.js --name Ontaris
pm2 start server.js --name server
pm2 list
pm2 stop service1  
pm2 restart Ontaris  
pm2 delete service1