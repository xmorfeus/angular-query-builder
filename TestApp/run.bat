@echo off

SET SERVER_LOCATION="c:\work-sfw\apache\tomcat7"
SET CURRENT_LOCATION=%cd%

call mvn -f "..\base\pom.xml" clean install -U
call mvn -f "..\common\pom.xml" clean install -U
call mvn -f "..\dbApi\pom.xml" clean install -U
call mvn -f "..\integration\pom.xml" clean install -U -Dmaven.test.skip=true
call mvn -f "..\boApi\pom.xml" clean install -U

if exist %SERVER_LOCATION%\webapps\boApi rmdir /S /Q %SERVER_LOCATION%\webapps\boApi
if exist %SERVER_LOCATION%\webapps\boApi.war del %SERVER_LOCATION%\webapps\boApi.war

xcopy /Y "..\boApi\target\boApi*.war" %SERVER_LOCATION%\webapps
ren %SERVER_LOCATION%\webapps\boApi*.war boApi.war

cd %SERVER_LOCATION%\bin
call startup.bat

cd %CURRENT_LOCATION%
start grunt watch

@echo off