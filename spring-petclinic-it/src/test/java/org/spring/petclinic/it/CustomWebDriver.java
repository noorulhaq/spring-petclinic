package org.spring.petclinic.it;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

public class CustomWebDriver extends SharedWebDriver{
	
	private static final String BASE_URL_KEY = "webdriver.base.url";
	private static final String JSCOVER_APP_URL = "/petclinic/jscoverage.html?index.html";
	private static final String JSCOVER_CACHE_CLEAR_URL = "/petclinic/jscoverage-clear-local-storage.html";
	private String baseURL;
	private static boolean isCachedCoverageResultCleared;
	
	public CustomWebDriver() {
		super();
		baseURL = System.getProperty(BASE_URL_KEY);   
        
		if(baseURL==null){
        	throw new IllegalArgumentException(BASE_URL_KEY+" system property definition is required.");
        }
        
        if(!isCachedCoverageResultCleared){
        	clearCachedCoverageResult();
        	isCachedCoverageResultCleared = true;
        	sleep(2);
        }
	}

	public CustomWebDriver clearCachedCoverageResult(){
    	getProxiedDriver().get(baseURL.concat(JSCOVER_CACHE_CLEAR_URL));
    	return this;
    }
    
    public CustomWebDriver login(){
    	getProxiedDriver().get(baseURL.concat(JSCOVER_APP_URL));
    	getProxiedDriver().switchTo().frame("browserIframe");
    	WebElement link  = getProxiedDriver().findElement(By.xpath("/html/body/data-ui-view/data-ng-include[1]/div/div/header/a[2]"));
    	link.click();
    	return this;
    }
	
    public CustomWebDriver saveJavascriptCoverage() throws Exception{
    	String json = (String)((JavascriptExecutor) getProxiedDriver()).executeScript("return jscoverage_serializeCoverageToJSON();");
    	JSCoverExecutionWriter writer = new JSCoverExecutionWriter();
    	writer.writeResult(json);
    	return this;
    }
    
    public CustomWebDriver waitUntil(int seconds,ExpectedCondition<Boolean> expectedCondition){
		(new WebDriverWait(getProxiedDriver(), seconds)).until(expectedCondition);
		return this;
    }
    
    public CustomWebDriver sleep(int seconds){
    	try {
			Thread.sleep(seconds*1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
    	return this;
    }
    
    public CustomWebDriver takeAction(Action action){
    	action.apply(getProxiedDriver());
    	return this;
    }   	
    
    public CustomWebDriver takeAction(int after,Action action){
    	sleep(after);
    	action.apply(getProxiedDriver());
    	return this;
    }   
	
}
