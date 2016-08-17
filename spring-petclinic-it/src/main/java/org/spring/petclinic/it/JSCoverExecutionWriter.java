package org.spring.petclinic.it;

import java.io.File;
import java.io.FileOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;

public class JSCoverExecutionWriter {
	
	 private static final Logger  LOG = LoggerFactory.getLogger(JSCoverExecutionWriter.class);

	
	 public void writeResult( String jsonResult) throws Exception{
		    String path = JSCoverExecutionWriter.class.getResource("/").getPath().concat("..").concat(File.separator).concat("jscoverage.json");
		  
		    LOG.info("File path: {}",path);
		    		   
			File file = new File(path);
			final FileOutputStream localFile = new FileOutputStream(file);
			localFile.write(jsonResult.getBytes());
			localFile.flush();
			localFile.close();
			
			Assert.isTrue(file.exists());
	 }
	 
	 
	 public static void main(String[] args) throws Exception {
		 JSCoverExecutionWriter writeR = new JSCoverExecutionWriter(); 
		 writeR.writeResult("fsfsdfsfsfs");
	}

}
