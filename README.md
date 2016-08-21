# spring-petclinic
This application under test is taken from a sample https://github.com/singularity-sg/spring-petclinic. I have just decomposed the application into multiple modules to create a multimodule maven project.

Decomposed modules are described below:

## spring-petclinic-api	
Exposes restful api for spring-petclinic-web module.
## spring-petclinic-domain
Contains the application domain till application service layer.
## spring-petclinic-web
Contains web layer artifacts developed in AngularJS.
## spring-petclinic-common
Common project shared among multiple modules.
## spring-petclinic-it
Contains automated acceptance tests.

