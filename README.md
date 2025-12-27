# WhatsApp Message Automation

Automated bulk messaging tool for WhatsApp Web supporting Sri Lankan phone numbers.

## Features

- Send messages to multiple numbers automatically
- Auto-formats Sri Lankan numbers to international format (+94)
- Read data from files or manual entry
- Progress tracking and delivery summary

## Requirements

- Python 3.7+
- Active WhatsApp account
- Internet connection

## Installation

```bash
pip install -r requirements.txt
```

Ensure you're logged into [WhatsApp Web](https://web.whatsapp.com) before running.

## Usage

```bash
python whatsapp_automation.py
```

**Options:**

- Load numbers from `numbers.txt` or enter manually
- Load message from `message.txt` or type directly
- Confirm and send

## Phone Number Formats

Accepts: `0771234567`, `771234567`, `+94771234567`, `94771234567`  
All converted to: `+94771234567`

## Important Notes

- Don't use mouse/keyboard during sending
- Max 20-30 messages per batch recommended
- WhatsApp may flag excessive messaging
- Recipients without your number saved will see messages in requests
- Use responsibly and only with consent

## Troubleshooting

**Messages not sending:** Increase wait times in code (lines 49, 58, 64)  
**Phone errors:** Verify valid Sri Lankan mobile numbers (9 digits)  
**Script crashes:** Check Python 3.7+, reinstall dependencies

## Example Files

**numbers.txt:**

```
0771234567
0772345678
+94773456789
```

**message.txt:**

```
Hello! This is an automated reminder about our event on January 15, 2028.
Please confirm your attendance.
```

## License

Free for personal and educational use. Follow WhatsApp's Terms of Service.

---

**Disclaimer:** Use for legitimate communication only. Always obtain consent before messaging.
