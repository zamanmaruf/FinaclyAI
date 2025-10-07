# Project-specific zsh configuration for FinaclyAI
# This file optimizes terminal performance for large repositories

# Disable untracked files dirty check (major performance improvement)
export DISABLE_UNTRACKED_FILES_DIRTY=true

# Optimize git prompt performance
export GIT_PS1_SHOWDIRTYSTATE=false
export GIT_PS1_SHOWSTASHSTATE=false
export GIT_PS1_SHOWUNTRACKEDFILES=false
export GIT_PS1_SHOWUPSTREAM=false

# Disable zsh completion system caching issues
export ZSH_DISABLE_COMPFIX=true

# Optimize completion system
export ZSH_AUTOSUGGEST_STRATEGY=(history completion)
export ZSH_AUTOSUGGEST_USE_ASYNC=true

# Disable slow git features
export GIT_DISCOVERY_ACROSS_FILESYSTEM=1

# Optimize Node.js performance
export NODE_OPTIONS="--max-old-space-size=4096"

# Project-specific aliases for common tasks
alias dev="npm run dev"
alias build="npm run build"
alias lint="npm run lint"
alias db:up="npm run db:up"
alias db:down="npm run db:down"
alias prisma:generate="npm run prisma:generate"
alias prisma:migrate="npm run prisma:migrate"

# Git aliases for faster workflow
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git log --oneline -10"

# Docker aliases
alias dcu="docker compose up"
alias dcd="docker compose down"
alias dcb="docker compose build"

# Clear screen and show current directory
alias cls="clear && pwd"

# Show project info
alias info="echo 'FinaclyAI Project' && echo 'Node: $(node --version)' && echo 'NPM: $(npm --version)' && echo 'Git: $(git --version)'"
