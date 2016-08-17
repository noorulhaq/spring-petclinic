package org.spring.petclinic.it.features.login;

import net.thucydides.core.annotations.Steps;
import org.spring.petclinic.it.steps.LoginSteps;
import cucumber.api.java.en.Given;

public class LoginStepsDefinition {
	
	@Steps
	private LoginSteps steps;
	
	@Given("^a registered user$")
	public void registered_user() throws Throwable {
		steps.login();
	}    		

}
