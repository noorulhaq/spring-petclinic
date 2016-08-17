package org.spring.petclinic.it.steps;

import org.spring.petclinic.it.CustomWebDriver;
import net.thucydides.core.steps.ScenarioSteps;
import net.thucydides.core.webdriver.WebDriverFacade;

public abstract class AbstractScenarioSteps extends ScenarioSteps{

	private static final long serialVersionUID = 8547006922417764911L;
	
	@Override
	public CustomWebDriver getDriver() {	
		return ((org.spring.petclinic.it.CustomWebDriver)((WebDriverFacade)super.getDriver()).getProxiedDriver());
	}
	

}
