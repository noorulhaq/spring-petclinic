package org.spring.petclinic.it.steps;

public class LoginSteps extends AbstractScenarioSteps{

	private static final long serialVersionUID = 841274956979625133L;
	
	public void login(){
		getDriver().sleep(2).login();
	}

}
