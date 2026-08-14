# Zoho Mail Setup for `hello@broadbandpicker.co.uk`

Last checked: `2026-06-19`

## Current DNS status

`broadbandpicker.co.uk` is currently using these nameservers:
- `ns1.wordpress.com`
- `ns2.wordpress.com`
- `ns3.wordpress.com`

That means you should add Zoho's DNS records in the DNS panel that controls the WordPress.com nameservers, not in Vercel.

Also, there are currently no MX records on the domain, so this is a clean setup.

## What Zoho currently offers

Zoho Mail currently lists a `Mail Free` plan with:
- up to 5 users
- one custom domain
- 5 GB mail storage per user
- no IMAP, POP, or ActiveSync

Zoho also notes that the free plan is only available in select data centers. If you do not see the free option during signup, that is likely why.

## Goal

Create a real inbox:
- `hello@broadbandpicker.co.uk`

This will give you:
- a real mailbox you can log into
- a sender address you can later verify in Brevo

## Step-by-step

### 1. Sign up for Zoho Mail

Go to Zoho Mail pricing or signup and look for the `Mail Free` plan.

Use:
- your own name as the admin
- `broadbandpicker.co.uk` as the domain

Zoho may ask for:
- a mobile number
- a recovery email
- an organization name

Use something like:
- Organization name: `BroadbandPicker`

### 2. Add the domain in Zoho

Inside Zoho Admin Console:
- choose to add a domain
- enter `broadbandpicker.co.uk`

Zoho will then give you a domain verification record.

This is usually either:
- a `TXT` record, or
- a `CNAME` record

### 3. Add the verification record in DNS

Open the DNS manager for the domain where the nameservers are active.

For this domain, that means the DNS provider behind the current WordPress.com nameservers.

Add exactly the verification record Zoho gives you.

Then go back to Zoho and click `Verify`.

### 4. Add Zoho MX records

After domain verification, Zoho will show you the exact MX records for your data center.

Add the MX records Zoho gives you in the same DNS panel.

Important:
- use Zoho's exact values for your region
- if any old MX records exist, remove or replace them
- right now this domain has no MX records, so you should not need to clean up any old mail routing

### 5. Add SPF

Zoho's SPF help page shows this record:

`v=spf1 include:zohomail.com -all`

Their step-by-step example also shows a soft-fail variant:

`v=spf1 include:zohomail.com ~all`

If Zoho is your only sending service for now, use the exact SPF record Zoho recommends in your setup screen.

Important:
- only one SPF record should exist for the domain
- if you later add Brevo sending, you may need to merge Zoho and Brevo into one SPF record instead of creating a second SPF record

### 6. Add DKIM

In Zoho Admin Console:
- go to `Domains`
- select `broadbandpicker.co.uk`
- open `Email Configuration`
- choose `DKIM`
- create a selector such as `zoho`

Zoho will generate a TXT record for something like:

`zoho._domainkey`

Add that TXT record in DNS, then return to Zoho and click `Verify`, then `Enable DKIM`.

### 7. Create the inbox

Create the user mailbox:

`hello@broadbandpicker.co.uk`

This should be your main contact inbox for:
- affiliate outreach
- publisher applications
- Brevo sender verification

### 8. Test the mailbox

After DNS propagates:
- log in to the Zoho mailbox
- send a test email from `hello@broadbandpicker.co.uk` to your personal email
- reply back to confirm inbound mail works too

### 9. Use it in Brevo later

Once the mailbox is working:
- add `hello@broadbandpicker.co.uk` as a sender in Brevo
- Brevo will likely send a verification email
- open the Zoho inbox and click the verification link

## Recommended order

1. Sign up for Zoho
2. Verify the domain
3. Add MX
4. Add SPF
5. Add DKIM
6. Create `hello@broadbandpicker.co.uk`
7. Test sending and receiving
8. Verify the sender in Brevo

## Notes for this domain

- Website hosting on Vercel does not matter for mailbox setup unless you are also using Vercel DNS
- Right now the live DNS authority is WordPress.com nameservers
- There is already a Google Search Console TXT record on the root domain, so do not delete unrelated TXT records while adding Zoho

## Official references

- Zoho Mail pricing: `https://www.zoho.com/mail/zohomail-pricing.html`
- Zoho domain verification: `https://www.zoho.com/mail/help/adminconsole/domain-verification.html`
- Zoho SPF setup: `https://www.zoho.com/mail/help/adminconsole/spf-configuration.html`
- Zoho DKIM setup: `https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html`
