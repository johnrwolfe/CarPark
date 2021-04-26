# CarPark
An automated carpark (parking garage) control system.  
## Configurations
The following configurations exist:
1. Interactive Testing.  Employs a modeled test bench, enabling interactive testing with Verifier and Ciera-generated code using `pom-testbench.xml`.
2. Automated Testing.  Intended for regression testing with both Verifier and generated code, this configuration employs a modeled test suite covering many use cases.  Use `pom-autotest.xml` for this one.
3. Browser-based Clients.  Leverages browser-based clients representing system peripherals such as entry and exit stands, payment machines, and an operator console.  Intended for testing and demonstration of code generated from the xtUML model of the carpark control system connected to externally produced code.  Use `pom-clients.xml` for this configuration.
## Importing for Interactive Testing
1. Add the built-in external entities provided by BridgePoint 7 or later.
2. Import the following projects from this repository:
- CarPark
- InteractiveTesting
## Importing for Automated Testing
1. Add the built-in external entities provided by BridgePoint 7 or later.
2. Import the TestFramework project from the [TestFramework repository.](https://github.com/amullarney/TestFramework)
3. Import the following projects from this repository:
- CarPark
- CarParkTestbench
## Importing for Browser-based Clients
1. Add the built-in external entities provided by BridgePoint 7 or later.
2. Import the following projects from this repository:
- CarPark
- Deployment
- EntryStand
- ExitStand
- OperatorConsole
- PaymentMachine
- TestControl
## Run for Interactive Testing (Verifier)
1. Create a debug configuration of type "xtUML eXecute Application" and name it Carpark-InterativeTest
2. Enable "Log model execution activity"
3. Disable "Run deterministically"
4. Disable "Enable simulated time"
5. Select the InteractiveTesting configuration within the InteractiveTesting project
6. Run Verifier using this debug configuration
7. Refer to the class descriptions of the test case classes within the InteractiveTestbench component for details on executing each test case or a bucket of multiple test cases.
## Run for Automated Testing (Verifier)
1. Create a debug configuration of type "xtUML eXecute Application" and name it Carpark-AutoTest
2. Enable "Log model execution activity"
3. Disable "Run deterministically"
4. Disable "Enable simulated time"
5. Select the AutoTest configuration within the InteractiveTesting project
6. Run Verifier using this debug configuration 
7. Execute any one of the functions found in TestFunctions package.
## Build and Run with Ciera
Note that it is not necessary to invoke BridgePoint or import projects into a workspace before building with Ciera.  After cloning the repository, just follow the instructions for building the configuration of interest.
### Interactive Testing
Within the top-level (git repo) directory:
1. Select the interactive testbench configuration by ensuring `pom-testbench.xml` has been copied to `pom.xml`.
2. Execute `mvn clean install`.  
3. Execute `bash ./run-test-servlet.sh`.
4. Verify "bucket successful" appears in console log.
### Automated Testing
Within the top-level (git repo) directory:
1. Select the automated testbench configuration by ensuring `pom-autotest.xml` has been copied to `pom.xml`.
2. Execute `mvn clean install`.  
3. Execute `bash ./run-autotest-servlet.sh`.
4. Verify that 3 test cases have passed in the summary report in the console log.
### Browser-based Clients
Within the top-level (git repo) directory:
1. Select the browser-based client configuration by ensuring `pom-clients.xml` has been copied to `pom.xml`.
2. Execute `mvn clean install`.  
3. Execute `bash ./run-clients-servlet.sh`.
4. Verify a transition in the console log indicating the Carpark is open.
5. Open at least one of each type of client in a browser:  localhost:8080/*clientType*.html where *clientType* is one of TestControl, OperatorConsole, EntryStand, ExitStand, PaymentMachine.
6. The current version of the application contains a fee schedule supporting a single day, April 1, 2025. Use the TestControl client to set the current date and time (as seen by the application) to something between 6:00 a.m. and 6:00 p.m. on this day.
7. Use the clients to execute and observe use cases.  For example, you might use the entry stand to put a car into the carpark, then use the test control to advance time (simulating a stay of a specified duration), then use the payment machine to pay for the stay, then use the test control to advance time again (simulating the time elapsed between paying for the stay and exiting the carpark), and finally use the exit stand to make the vehicle exit the carpark.
