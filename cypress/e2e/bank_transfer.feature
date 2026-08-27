@transfer
Feature: Create a bank transfer via a form

  As an authorized user (Administrator or Purchase Manager)
  I want to be able to fill a form
  So that I can create a bank transfer

  Rule: Only authorized users may create a transfer

    @rbac @smoke
    Scenario Outline: Access to transfer creation depends on the role
      Given I am logged in as "<role>"
      When I open the bank transfer page
      Then the transfer creation is "<access>"

      Examples:
        | role             | access    |
        | Administrator    | allowed   |
        | Purchase Manager | allowed   |
        | Standard User    | forbidden |


  Rule: An authorized user can fill and submit the transfer form

    Background:
      Given I am logged in as "Administrator"
      And I am on the bank transfer page

    @happy_path @smoke @positive
    Scenario Outline: Successful confirmation with <testcase>
      When I fill the form with the "<category>" dataset "<dataset>"
      And I validate the form
      Then the transfer is confirmed

      Examples:
        | testcase           | category   | dataset         |
        | instant transfer   | happy_path | valid_instant   |
        | scheduled transfer | happy_path | valid_scheduled |


    @unhappy_path @negative
    Scenario Outline: Unsuccessful confirmation with <testcase>
      When I fill the form with the "<category>" dataset "<dataset>"
      And I validate the form
      Then an error message "<result>" is displayed

      Examples:
        | testcase                 | category     | dataset                  | result                     |
        | label with special chars | unhappy_path | label_with_special_chars | Invalid label              |
        | non-alphanumeric IBAN    | unhappy_path | iban_non_alphanumeric    | Invalid IBAN               |
        | missing beneficiary      | unhappy_path | missing_beneficiary      | Beneficiary is required    |
        | missing IBAN             | unhappy_path | missing_iban             | IBAN is required           |
        | missing label            | unhappy_path | missing_label            | Label is required          |
        | missing amount           | unhappy_path | missing_amount           | Amount is required         |
        | missing date (scheduled) | unhappy_path | missing_date_scheduled   | Transfer date is required  |

    @unhappy_path @negative
    Scenario: Switching from Instant to Scheduled enforces the required date
      When I fill the form with the "happy_path" dataset "valid_instant"
      And I select the "Scheduled" transfer mode
      And I validate the form
      Then an error message "Transfer date is required" is displayed

    @boundary @positive
    Scenario Outline: Successful confirmation at boundary with <testcase>
      When I fill the form with the "<category>" dataset "<dataset>"
      And I validate the form
      Then the transfer is confirmed

      Examples:
        | testcase                | category        | dataset          |
        | amount at minimum       | boundary_amount | amount_min_valid |
        | amount at maximum       | boundary_amount | amount_max_valid |
        | IBAN at minimum length  | boundary_iban   | iban_min_valid   |
        | IBAN at maximum length  | boundary_iban   | iban_max_valid   |
        | label at maximum length | boundary_label  | label_max_valid  |
        | date at minimum         | boundary_date   | date_min_valid   |
        | date at maximum         | boundary_date   | date_max_valid   |

    @boundary @negative
    Scenario Outline: Unsuccessful confirmation at boundary with <testcase>
      When I fill the form with the "<category>" dataset "<dataset>"
      And I validate the form
      Then an error message "<result>" is displayed

      Examples:
        | testcase                  | category        | dataset          | result                |
        | amount below minimum      | boundary_amount | amount_below_min | Invalid amount        |
        | amount above maximum      | boundary_amount | amount_above_max | Invalid amount        |
        | IBAN below minimum length | boundary_iban   | iban_below_min   | Invalid IBAN          |
        | IBAN above maximum length | boundary_iban   | iban_above_max   | Invalid IBAN          |
        | label above maximum length| boundary_label  | label_above_max  | Invalid label         |
        | date below minimum        | boundary_date   | date_below_min   | Invalid transfer date |
        | date above maximum        | boundary_date   | date_above_max   | Invalid transfer date |
