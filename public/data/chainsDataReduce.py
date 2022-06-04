import json

with open('./public/data/chains.json', 'r') as f:
    chains = json.load(f)

chains_id_idx = {}

for d in chains:
    chains_id_idx[d['chainId']] = {
            'name':d['name'],
            'nativeAsset':d['nativeCurrency']['symbol']
        }

with open('./public/data/chains_small.json','w') as f:
    json.dump(chains_id_idx, f)
