package org.spring.petclinic.it.steps;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.spring.petclinic.it.Action;

public class SearchPetsSteps extends AbstractScenarioSteps{

	private static final long serialVersionUID = -9058480755359036208L;

	public void searchPets(){
		
		getDriver().takeAction(new Action() {
			public void apply(WebDriver d) {
		    	WebElement link  = d.findElement(By.partialLinkText("Pets"));
		    	link.click();
			}
		});
	}
	
	public void verifySearchResults(){
		getDriver().waitUntil(5, new ExpectedCondition<Boolean>() {
		    public Boolean apply(WebDriver d) {
		        return d.findElement(By.id("pets")).isDisplayed();
		    }
		});	 	
	}	
}
