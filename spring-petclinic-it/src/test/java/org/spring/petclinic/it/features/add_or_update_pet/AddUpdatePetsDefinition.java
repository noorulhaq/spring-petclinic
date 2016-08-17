package org.spring.petclinic.it.features.add_or_update_pet;

import net.thucydides.core.annotations.Steps;
import org.spring.petclinic.it.steps.AddUpdatePetSteps;
import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;

public class AddUpdatePetsDefinition {
	
	@Steps
	private AddUpdatePetSteps steps;
	
	@Given("^owner with (\\d+)$")
	public void owner_with_identifier(int identifier) throws Throwable {
		steps.selectAnOwner(identifier);
	}
	
	@When("^add a new pet with \"([^\"]*)\" and \"([^\"]*)\" agaisnt an owner$")
	public void add_a_new_pet_with_and_agaisnt_an_owner(String name, String type) throws Throwable {
		steps.addNewPet(name, type);
	}
	
	@Then("^I shoud be able to see it under same owner (\\d+) profile with same \"([^\"]*)\" and \"([^\"]*)\"$")
	public void i_shoud_be_able_to_see_it_under_same_owner_profile_with_same_and(int identifier, String name, String type) throws Throwable {
		steps.verifyPetAddition(identifier,name, type);
	}
	

}
