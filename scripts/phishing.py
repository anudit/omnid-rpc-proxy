import requests
import json
from tqdm import tqdm
import time
import itertools
import sys

def read_file(fn=""):
    f = open(fn)
    return json.load(f)

def chunk(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

def compile_blacklist():
  blacklist = []

  def iter1(k):
    return k['id']

  def iter2(k):
    return k.replace("'", "").replace("http://", "").replace("https://", "")

  b1 = requests.get('https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json').json()
  blacklist += b1

  b2 = requests.get('https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json').json()['blacklist']
  blacklist += b2

  b3 = list(map(iter1, requests.get('https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/urls/urls-darklist.json').json()))
  blacklist += b3

  b4 = list(map(iter2,requests.get('https://raw.githubusercontent.com/DAOBuidler/MetaShieldExtension/main/function/data/domain_blacklist.json').json()))
  blacklist += b4

  b5 = requests.get('https://api.cryptoscamdb.org/v1/blacklist').json()['result']
  blacklist += b5

  b6 = requests.get('https://wallet-guard-server-prod.herokuapp.com/lists/all', headers={
      'Origin': 'chrome-extension://pdgbckgdncnhihllonhnjbdoighgpimk'
  }).text
  b6 = json.loads(b6)['blocklist']
  blacklist += b6

  b7 = requests.get('https://gist.githubusercontent.com/anudit/643a5a5a7b105a563836578fa6dfdbd1/raw/e33c2b553e6f0b4e04549012ad3f3fd0dd08a3f4/Chainabuse-ScamDomains.json').json()
  blacklist += b7

  blacklist = list(set(blacklist))
  print(len(blacklist))
  return blacklist

def get_ip_location(ip_and_domain = []):

    def iter1(inp):
        (ind, val) = inp
        val['domain'] = ip_and_domain[ind][0]
        return val

    fields = "status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query"

    data = list(map(lambda x: {"query": x[1], "fields": fields}, ip_and_domain))

    headers = { 'Content-Type': 'application/json' }
    try:
        resp = requests.request("POST", 'http://ip-api.com/batch', data=json.dumps(data), headers=headers)
        resp_json = resp.json()
        if (int(resp.headers['X-Rl']) <= 2):
            print(f"throttled for {resp.headers['X-Ttl']}s")
            time.sleep(int(resp.headers['X-Ttl'])+4)

        return list(map(iter1, enumerate(resp_json)))
    except:
        print('error', sys.exc_info())
        return []


def get_ips(domain = "", no_location = False):
    cleandomain = domain.encode("ascii", "ignore")
    cleandomain = cleandomain.decode()
    link = f"https://dns.google/resolve?name={cleandomain}&type=A"
    try:
        req = requests.get(link).json()
        if ('Answer' in req):
            ips = list(map(lambda x : x['data'], req['Answer']))
            if (no_location == True):
                return {'status': True, 'domain': domain, 'ips': ips }
            else:
                location_data = get_ip_location(ips, domain)
                return {'status': True, 'domain': domain, 'ips': location_data }
        else:
            return {'status': False, 'domain': domain,'ips': [] }
    except:
        print('get_ips error', domain, link)
        return {'status': False, 'domain': domain, 'ips': [] }


def store_to_file(phishing_data):
    print('Storing file')

    json_object = json.dumps(phishing_data, indent=4)
    with open("phishing_data_final.json", "w") as outfile:
        outfile.write(json_object)

    active_domains = list(filter(lambda x: True if(x['status'] == True) else False, phishing_data))
    just_ips = list(map(lambda x: x['ips'], active_domains))
    just_ips = list(itertools.chain(*just_ips))
    just_ips = list(filter(lambda x: True if(x['status'] == "fail") else False, just_ips))

    json_object = json.dumps(just_ips, indent=4)
    with open("just_ips_final.json", "w") as outfile:
        outfile.write(json_object)

def store_domain_and_ip(ip_data):
    print('Storing file')

    json_object = json.dumps(ip_data, indent=4)
    with open("ip_data_3.json", "w") as outfile:
        outfile.write(json_object)


def pipline2():
    fd = read_file('./final_ip_data.json')

    data = list(filter(lambda x: True if(x['status'] == True) else False, fd))
    domain_to_ip = []
    for dat in data:
        for ip in dat['ips']:
            domain_to_ip.append([dat['domain'], ip])

    domain_to_ip = list(chunk(domain_to_ip, 100))

    print('data', len(domain_to_ip), len(domain_to_ip[0]))

    phishing_data = []
    for ind, ip_chunk in tqdm(enumerate(domain_to_ip)):
        location_data = get_ip_location(ip_chunk)
        phishing_data += location_data
        if (ind != 0 and ind % 100 == 0):
            store_to_file(phishing_data)

    store_to_file(phishing_data)

def pipline():
    blacklist = compile_blacklist()
    domain_and_ip = []
    for ind, dom in tqdm(enumerate(blacklist)):
        if(dom == "" or dom == None):
            continue
        res = get_ips(dom, no_location=True)
        domain_and_ip.append(res)
        if (ind != 0 and ind % 100 == 0):
            store_domain_and_ip(domain_and_ip)

    store_domain_and_ip(domain_and_ip)


pipline2()
