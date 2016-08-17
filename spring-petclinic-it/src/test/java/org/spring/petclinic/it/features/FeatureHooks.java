package org.spring.petclinic.it.features;

import net.thucydides.core.annotations.Managed;
import net.thucydides.core.webdriver.WebDriverFacade;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.spring.petclinic.it.Action;
import org.spring.petclinic.it.CustomWebDriver;

import cucumber.api.java.After;
import cucumber.api.java.Before;

public class FeatureHooks{
	
	
	private static final Logger LOG =  LoggerFactory.getLogger(FeatureHooks.class);
	
    @Managed
    WebDriver driver;

    @Before
	public void setup() {
    	LOG.debug("feature setup");
	}

	@After
	public void tearDown(){
		LOG.debug("feature tearDown");
		signout();
		saveJvascriptCoverage();		
	}

	private void signout(){

		try {
			getDriver().waitUntil(5,signoutMenuAppears).sleep(2).takeAction(signoutMenuOpenAction).waitUntil(5,signoutLinkAppears).takeAction(signoutAction);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	private void saveJvascriptCoverage(){
		try {
			getDriver().saveJavascriptCoverage();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	private CustomWebDriver getDriver(){
		return ((org.spring.petclinic.it.CustomWebDriver)((WebDriverFacade)driver).getProxiedDriver());
	}
	
	private ExpectedCondition<Boolean> signoutMenuAppears = new ExpectedCondition<Boolean>() {		
		@Override
		public Boolean apply(WebDriver d) {
			return d.findElement(By.xpath("/html/body/data-ng-include[1]/nav/div/ul/li[3]/a")).isDisplayed();
		}
	};
	
	private Action signoutMenuOpenAction = new Action(){
		@Override
		public void apply(WebDriver d) {
			d.findElement(By.xpath("/html/body/data-ng-include[1]/nav/div/ul/li[3]/a")).click();
		}
	};
	
	private ExpectedCondition<Boolean> signoutLinkAppears = new ExpectedCondition<Boolean>() {
		@Override
		public Boolean apply(WebDriver d) {
			return d.findElement(By.partialLinkText("Sign Out")).isDisplayed();
		}		
	};
	
	
	private Action signoutAction = new Action(){
		@Override
		public void apply(WebDriver d) {
			d.findElement(By.partialLinkText("Sign Out")).click();
		}
	};

}
