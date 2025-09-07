# Prompt
Used in Anthropic Code
2029-09-07

The web app you are to create needs to fullfil the following functional requirements:

Create a client-side only rendered Nuxt 3 application that allows people to sign up for a product. The form should contain fields for email and password, which should be required and show an error if no value is entered. The password field should have a way to make the password visible. The user should be able to choose to receive occasional product updates and announcements. Once signed up, they should be presented with a success page.

Use the Nordhealth Design System - VET Theme ([https://nordhealth.design/?theme=vet/]) appropriately!!

Read https://nordhealth.design/web-components/ to learn how to use the Provet components in Vue. Please, use TypeScript."

The web app must also fulfill the following stylistic and general requirememnts regarding code quality:
- Unit tests are a must (use Vitest)
- Playwright shoulkd be set up and key user flows shold be end-to-end tested with it.
- The code must have a clean structure.
- The code must be documented (installation and functionalities).
- Password complexity (and the corresponding validation) should be high and cofigurable in a config file. 
- The NordHealth Veterinary design system must be used for the app (https://nordhealth.design/).
- Use route guards for the password-protected page views of the app.

Write a Claude.md text according to these specifications to be used inside the project and prescribe where that file goes inside the project.
Write a README.md documentation describing the setup and the functionality of the app.
