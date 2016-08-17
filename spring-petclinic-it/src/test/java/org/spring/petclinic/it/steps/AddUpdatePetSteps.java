package org.spring.petclinic.it.steps;

import org.openqa.selenium.By;
import org.spring.petclinic.it.page.OwnerProfilePage;

public class AddUpdatePetSteps  extends AbstractScenarioSteps{

	private static final long serialVersionUID = -6657670204450070390L;
	
	private OwnerProfilePage ownerProfilePage;
	
	public void selectAnOwner(int identifier){
		getDriver().findElement(By.xpath(".//*[@id='owners']/div/div/div/div/a[@href='#/owners/"+identifier+"']")).click();
	}
	
	public void addNewPet(final String name, final String type){		
		ownerProfilePage.addNewPet(name, type);
	}
	
	public void verifyPetAddition(int identifier,String name, String type){
		ownerProfilePage.verifyNewPetAddition(identifier, name, type);
	}
	
	
	public void updateExistingPet(String name, String type){
		
	}
	
	
	public void verifyPetUpdation(String name, String type){
		
	}

}
