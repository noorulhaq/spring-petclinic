Feature: Add or update pet information.

	As a registered user
	I should be able to add or update pet information 
	So that I can keep pets information up to date.

	Scenario Outline: Add a new pet for owner
		Given a registered user
		And owner with identifier <id_param>
		When add a new pet with name <name_param> and type <type_param> agaisnt an owner
		Then I shoud be able to see it under respective owner's <id_param> profile with same name <name_param> and type <type_param>
	
		@Dev
		Examples:
		| id_param | name_param | type_param |
		| 1 | "Dolly" | "1" |
	    | 1 | "Shadow" | "2" |
	   
	    @Qmg
		Examples:
		| id_param | name_param | type_param |
		| 1 | "Ketty" | "1" |
	    | 1 | "Lucy" | "2" |
		
		

		