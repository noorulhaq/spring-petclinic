Feature: List all the registered vets.

	# <<UserStory>>
	# As a registered user
	# I should be able to search list available vets
	# So that I can choose any one of them to schedule appointment

	Scenario: Search vets without any criteria
		Given a registered user
		When I search vets without any criteria
		Then I shoud get a list of vets