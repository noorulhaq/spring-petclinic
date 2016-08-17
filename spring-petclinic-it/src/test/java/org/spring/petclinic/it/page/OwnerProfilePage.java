package org.spring.petclinic.it.page;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;

public class OwnerProfilePage extends PageObject{
	
	private NewPetPage newPetPage; 
	
	@FindBy(xpath="//*[@id='pets']/div/div/button")
	private WebElement addNewButton;
	
	
	public void addNewPet(final String name, final String type){
		waitFor(addNewButton).click();
		waitABit(1000);
		newPetPage.addPet(name, type);
		newPetPage.saveChanges();
	}
	
	
	public void verifyNewPetAddition(int identifier,String name, String type){
		getDriver().findElement(By.xpath("//*[@id='pets']//h3[@data-ng-bind='pet.name' and text()='"+name+"']"));
	}

}
