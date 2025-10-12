# Contributing to Southern Leyte Earthquake Alert System

Thank you for your interest in contributing to the Southern Leyte Earthquake Alert System! This document provides guidelines for contributing to this project.

## 🌟 How to Contribute

We welcome contributions from the community! Here are some ways you can help:

- 🐛 Report bugs and issues
- 💡 Suggest new features or enhancements
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new features
- 🎨 Improve UI/UX design
- 🌐 Add translations or localization

## 📋 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn package manager
- Git
- A modern web browser

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EarthquakeSys.git
   cd EarthquakeSys
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Make your changes** and test them thoroughly

## 🔨 Development Workflow

### Code Style

This project uses ESLint and TypeScript for code quality. Please ensure your code follows these guidelines:

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` to check for linting errors
- Run `npm run lint:fix` to automatically fix linting issues
- Run `npm run type-check` to verify TypeScript types

### Testing Your Changes

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

3. **Test your changes thoroughly:**
   - Check all affected features
   - Test on different screen sizes (mobile, tablet, desktop)
   - Verify browser compatibility
   - Test offline functionality (PWA features)

### Commit Guidelines

We follow conventional commit messages for clarity:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes (formatting, etc.)
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for maintenance tasks

Example:
```bash
git commit -m "feat: add earthquake intensity filter"
git commit -m "fix: correct map marker positioning"
git commit -m "docs: update README with new features"
```

## 📝 Pull Request Process

1. **Update documentation** if needed (README.md, inline comments)

2. **Ensure all checks pass:**
   - Linting: `npm run lint`
   - Type checking: `npm run type-check`
   - Build: `npm run build`

3. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots for UI changes
   - Link to related issues (if applicable)

4. **Wait for review:**
   - Maintainers will review your PR
   - Address any requested changes
   - Be patient and respectful

5. **Merge:**
   - Once approved, a maintainer will merge your PR
   - Your contribution will be credited

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs **actual behavior**
4. **Screenshots or videos** if applicable
5. **Environment details:**
   - Browser and version
   - Operating system
   - Device (if mobile)
6. **Error messages** from console (if any)

## 💡 Suggesting Features

When suggesting new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the feature** clearly and in detail
3. **Explain the use case** - why is this feature needed?
4. **Provide examples** or mockups if possible
5. **Consider the scope** - does it fit the project's goals?

## 🔐 Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, please report security issues responsibly:
- Contact the maintainers directly
- Provide detailed information about the vulnerability
- Allow time for the issue to be fixed before public disclosure

See [SECURITY.md](./SECURITY.md) for more details.

## 🌐 Localization

To contribute translations:

1. Create a new language file in the appropriate directory
2. Follow the existing translation format
3. Ensure all strings are translated accurately
4. Test the translation in the application

## 📖 Documentation

Good documentation is crucial! You can help by:

- Fixing typos or unclear explanations
- Adding examples or tutorials
- Improving code comments
- Creating or updating diagrams
- Writing blog posts or guides

## 🎯 Project Goals and Scope

Keep in mind the project's goals when contributing:

- **Primary Focus:** Southern Leyte earthquake monitoring
- **Real-time Data:** Using USGS API
- **User Safety:** Features that help keep people safe
- **Accessibility:** Mobile-friendly, offline-capable
- **Performance:** Fast, lightweight application
- **Security:** Protecting user data and privacy

## ❓ Questions?

If you have questions about contributing:

- Check existing issues and discussions
- Review the README and documentation
- Open a discussion on GitHub
- Contact the maintainers

## 📄 Code of Conduct

Please note that this project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🙏 Thank You!

Every contribution, no matter how small, is valuable and appreciated. Thank you for helping make the Southern Leyte Earthquake Alert System better for everyone!

---

**Developer:** John Rish Ladica - Southern Leyte, Philippines

**Remember:** This is a community safety tool. Your contributions can help save lives! 🌏💚
