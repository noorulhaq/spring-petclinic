#Automated Acceptance Testing with Code Coverage Sample

The purpose of this project is to demonstrate how coverage against BDD based acceptance tests can be achieved for both java and javascript at the same time. After following execution steps you should be able to see covergae results in sonar as shown below.

![alt tag](https://github.com/noorulhaq/spring-petclinic/blob/master/assets/sonar.png)

Acceptance tests are witten using following frameworks:
* Cucumber
* Selenium Web Driver
* Serenity 

Below is the sample automated acceptance test outcome that you will find in spring-petclinic-it/target/site/serenity folder after execution of tests:
![alt tag](https://github.com/noorulhaq/spring-petclinic/blob/master/assets/report.png) 

## spring-petclinic (AUT)
Application under test is taken from a sample https://github.com/singularity-sg/spring-petclinic. I have just decomposed the application into multiple modules to create a multimodule maven project.

Decomposed modules are described below:

### spring-petclinic-api	
Exposes restful api consumed by spring-petclinic-web module.
### spring-petclinic-domain
Contains the application domain till application service layer.
### spring-petclinic-web
Contains web layer artifacts developed in AngularJS.
### spring-petclinic-common
Common project shared among multiple modules.
### spring-petclinic-it
Contains automated acceptance tests.

## Execution Steps
* Run __mvn clean install__ at project root level.
* Launch api project using __mvn cargo:run -P cargo-tomcat__ command inside __spring-petclinic-api__ module.
* Launch api project using __mvn cargo:run -P cargo-tomcat__ command inside __spring-petclinic-web__ module.
* Access web application from any proxy server (Apache, Nginx). Refer to sample configuration file provided in assests folder for apache web server.
* Execute acceptance tests using __mvn verify -e -P it-tests,Dev__ command from spring-petclinic-it module with following JVM arguments:
<br/>-Dselenium.driver=org.openqa.selenium.chrome.ChromeDriver
<br/>-Dwebdriver.chrome.driver=/Users/husainbasrawala/Downloads/chromedriver
<br/>-Dwebdriver.base.url=http://localhost:7272
<br/> Here __webdriver.base.url__ is the url where your webserver serves the petclinic application.
* Run __mvn verify -e -P collect-it-data__ at project root level to collect the code coverage stats.
* Run __mvn sonar:sonar -pl !spring-petclinic-it,!spring-petclinic-common  -Dsonar.host.url=http://docker.me:9001__ command at project root level to submit the stats to sonarQube. Change __Dsonar.host.url__ value to your sonarQube location.
