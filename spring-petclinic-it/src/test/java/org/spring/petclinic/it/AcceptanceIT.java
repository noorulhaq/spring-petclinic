package org.spring.petclinic.it;

import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;
import cucumber.api.CucumberOptions;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(glue = {"org.spring.petclinic.it.features"},features={"src/test/resources/features"})
public class AcceptanceIT {

}
