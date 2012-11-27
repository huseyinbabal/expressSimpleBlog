ALL_TESTS = $(shell find tests/ -name '*.test.js')
REPORTER = spec
UI = bdd

test:
	@./node_modules/.bin/mocha \
		--require should \
		--require tests/common \
		--reporter $(REPORTER) \
		--ui $(UI) \
		--growl \
		$(ALL_TESTS)

.PHONY: test
