Feature: Add or update pet information.

	# <<UserStory>>
	# As a registered user
	# I should be able to add or update pet information 
	# So that I can keep pets information up to date.

	Scenario Outline: Add a new pet for owner
		Given a registered user
		And owner with <identifier>
		When add a new pet with <name> and <type> agaisnt an owner
		Then I shoud be able to see it under same owner <identifier> profile with same <name> and <type>
		
		Examples:
		| identifier | name | type |
		| 1 | "Dolly" | "1" |
	    | 1 | "Shadow" | "2" |
		

		