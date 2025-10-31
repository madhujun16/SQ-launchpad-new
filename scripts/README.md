# Scripts Directory

This directory contains utility scripts for development, deployment, and maintenance tasks.

## 📁 Directory Structure

```
scripts/
├── analyze-bundle.js    # Bundle analysis script
├── fix_organizations.sh # Organization data fix script
└── README.md           # This file
```

## 🛠️ Available Scripts

### `fix_organizations.sh`
**Purpose**: Fix organization data issues
**Usage**: 
```bash
chmod +x scripts/fix_organizations.sh
./scripts/fix_organizations.sh
```

### `analyze-bundle.js`
**Purpose**: Analyze JavaScript bundle size and dependencies
**Usage**:
```bash
node scripts/analyze-bundle.js
```

## 📋 Adding New Scripts

When adding new scripts:

1. **Use descriptive names**: `deploy-production.sh`, `backup-database.sh`
2. **Add shebang**: `#!/bin/bash` for shell scripts
3. **Make executable**: `chmod +x script-name.sh`
4. **Document usage**: Add comments explaining parameters and usage
5. **Update this README**: Document new scripts here

## 🔧 Best Practices

- **Error Handling**: Include proper error handling and exit codes
- **Logging**: Add logging for debugging and monitoring
- **Parameters**: Use command-line parameters for flexibility
- **Validation**: Validate inputs and prerequisites
- **Documentation**: Document all scripts with examples

## 📞 Support

For script-related issues:
- Check script documentation and comments
- Review error messages and logs
- Refer to project documentation in `docs/`
