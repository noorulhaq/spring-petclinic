package org.spring.petclinic.it.features.search_pets;

import org.spring.petclinic.it.steps.SearchVetsSteps;
import net.thucydides.core.annotations.Steps;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;

public class SearchVetsStepsDefinition{
	
	@Steps
	private SearchVetsSteps steps;


	@When("^I search vets without any criteria$")
	public void i_search_vets_without_any_criteria() throws Throwable {
		steps.searchVets();
	}

	@Then("^I shoud get a list of vets$")
	public void i_shoud_get_a_list_of_vets() throws Throwable {
		steps.verifySearchResults();
	}

}
