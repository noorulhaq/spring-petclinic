package org.spring.petclinic.it.features.search_vets;

import org.spring.petclinic.it.steps.SearchPetsSteps;
import net.thucydides.core.annotations.Steps;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;

public class SearchPetsStepsDefinition{
 
	@Steps
	private SearchPetsSteps steps;	
	

	@When("^I search pets without any criteria$")
	public void i_search_vets_without_any_criteria() throws Throwable {
		steps.searchPets();
	}

	@Then("^I shoud get a list of pets$")
	public void i_shoud_get_a_list_of_vets() throws Throwable {
		steps.verifySearchResults();
	}
}
