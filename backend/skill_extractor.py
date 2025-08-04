import sys
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

SKILL_KEYWORDS = [
    # Core Programming Languages
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
    'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'haskell',
    'elixir', 'clojure',

    # Frontend Technologies
    'react', 'angular', 'vue', 'svelte', 'jquery', 'html', 'css', 'sass',
    'less', 'bootstrap', 'tailwind', 'material-ui', 'webassembly', 'next.js',
    'nuxt.js', 'gatsby',

    # Backend Technologies
    'nodejs', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel',
    'ruby on rails', 'graphql', 'rest', 'api', 'microservices', 'serverless',
    'fastapi', 'nest.js',

    # Database
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'sqlite', 'oracle',
    'redis', 'cassandra', 'dynamodb', 'firebase', 'elasticsearc', 'neo4j',

    # Cloud & DevOps
    'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'jenkins',
    'terraform', 'ansible', 'chef', 'puppet', 'ci/cd', 'devops', 'lambda',
    'ec2', 's3', 'iam', 'cloudformation', 'azure devops', 'gke', 'eks', 'digitalocean',

    # Blockchain & Web3
    'solidity', 'blockchain', 'web3', 'ethereum', 'solana', 'truffle',
    'hardhat', 'remix', 'ganache', 'ether.js', 'web3.js', 'metamask',
    'smart contracts', 'erc-20', 'erc-721', 'defi', 'nft', 'crypto', 'polygon',
    'binance smart chain', 'substrate', 'polkadot', 'cosmos', 'avalanche',
    'chainlink', 'oracles', 'ipfs', 'arweave', 'rust', 'anchor',

    # Data Science & Machine Learning
    'python', 'r', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
    'keras', 'jupyter', 'data science', 'machine learning', 'deep learning',
    'nlp', 'computer vision', 'data analysis', 'etl', 'apache spark', 'hadoop',

    # Tools & Methodologies
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'agile',
    'scrum', 'kanban', 'unit testing', 'ci/cd', 'jenkins', 'docker compose',
    'npm', 'yarn', 'webpack', 'babel', 'trello', 'asana',

    # Soft Skills (NLP-friendly keywords)
    'communication', 'teamwork', 'leadership', 'problem-solving', 'adaptability',
    'critical thinking', 'creativity', 'time management', 'collaboration',
    'attention to detail',

    # General
    'developer', 'engineer', 'architect', 'analyst', 'manager', 'specialist',
    'programmer', 'coding', 'software development', 'fullstack', 'frontend',
    'backend', 'qa', 'quality assurance', 'devsecops'
]

def extract_skills_from_text(text):
    """
    Extracts skills from a given text using a simple keyword matching approach.
    """
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(text.lower())
    filtered_words = [w for w in word_tokens if not w in stop_words and w.isalnum()]

    extracted_skills = set()
    for word in filtered_words:
        if word in SKILL_KEYWORDS:
            extracted_skills.add(word)

    for i in range(len(filtered_words) - 1):
        bigram = f"{filtered_words[i]} {filtered_words[i+1]}"
        if bigram in SKILL_KEYWORDS:
            extracted_skills.add(bigram)
            
    for i in range(len(filtered_words) - 2):
        trigram = f"{filtered_words[i]} {filtered_words[i+1]} {filtered_words[i+2]}"
        if trigram in SKILL_KEYWORDS:
            extracted_skills.add(trigram)

    return list(extracted_skills)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        skills = extract_skills_from_text(input_text)
        print(json.dumps(skills))
    else:
        print(json.dumps([]))