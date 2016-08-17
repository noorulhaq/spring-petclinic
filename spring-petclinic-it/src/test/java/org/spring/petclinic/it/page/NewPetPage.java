package org.spring.petclinic.it.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;

public class NewPetPage extends PageObject{
	
	
	@FindBy(xpath="//*[@data-ng-model='currentPet.name']")
	private WebElement nameField;
	
	@FindBy(id="type")
	private WebElement typeField;
	
	@FindBy(xpath="//*[@id='petModal']//button[@data-target='#addPetSuccessModal']")
	private WebElement saveButton;
	
	@FindBy(xpath="//*[@id='addPetSuccessModal']//button[text()='Not Now']")
	private WebElement notNowButton;
	
	public void addPet(String name,String type){
		nameField.sendKeys(name);
		new Select(typeField).selectByValue(type);
	}
	
	public void saveChanges(){
		saveButton.click();
		waitABit(1000);
		notNowButton.click();
	}

}
