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
* Run --mvn clean install-- at project root level. 
