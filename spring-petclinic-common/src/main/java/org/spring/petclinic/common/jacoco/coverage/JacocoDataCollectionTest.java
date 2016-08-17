package org.spring.petclinic.common.jacoco.coverage;

import java.io.File;
import java.io.FileOutputStream;
import javax.management.MBeanServerConnection;
import javax.management.MBeanServerInvocationHandler;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;

public final class JacocoDataCollectionTest {

	private static String DESTFILE = "target/jacoco-it.exec";
	private static String SERVICE_URL = "service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi";
	private static final Logger  LOG = LoggerFactory.getLogger(JacocoDataCollectionTest.class);

	public static void main(final String[] args) throws Exception {
		
		if(args.length==2){
			SERVICE_URL = args[0];
			DESTFILE = args[1];
		}
		
		LOG.info("JMX service url is: {}",SERVICE_URL);
		LOG.info("Destinal file url is: {}",DESTFILE);
		
		// Open connection to the coverage agent:
		final JMXServiceURL url = new JMXServiceURL(SERVICE_URL);
		final JMXConnector jmxc = JMXConnectorFactory.connect(url, null);
		final MBeanServerConnection connection = jmxc.getMBeanServerConnection();

		final IProxy proxy = (IProxy) MBeanServerInvocationHandler.newProxyInstance(connection, new ObjectName("org.jacoco:type=Runtime"), IProxy.class, false);

		// Retrieve JaCoCo version and session id:
		System.out.println("Version: " + proxy.getVersion());
		System.out.println("Session: " + proxy.getSessionId());

		// Retrieve dump and write to file:
		final byte[] data = proxy.getExecutionData(true);
		File file = new File(DESTFILE);
		final FileOutputStream localFile = new FileOutputStream(file);
		localFile.write(data);
		localFile.close();
		
		proxy.reset();
		
		Assert.isTrue(file.exists());
		// Close connection:
		jmxc.close();
	}

	public interface IProxy {
		String getVersion();

		String getSessionId();

		void setSessionId(String id);

		byte[] getExecutionData(boolean reset);

		void dump(boolean reset);

		void reset();
	}

}
