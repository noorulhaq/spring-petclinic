Feature: List all the registered pets.

	# <<UserStory>>
	# As a registered user
	# I should be able to search list available pets
	# So that I can choose any one of them view their detail

	Scenario: Search pets without any criteria
		Given a registered user
		When I search pets without any criteria
		Then I shoud get a list of pets