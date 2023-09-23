let pid = 'b8057a25-33ac-5da4-ab62-415674972119'
let bearer = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjMwZTQ0MjE1LThjZTAtNDdiZi04Y2Y1LWQwNGViOGM4ZTI1N3NpZyJ9.eyJpYXQiOjE2ODYyOTA3NTIsImV4cCI6MTY4NjI5NDM1MiwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiZmFmNzNhN2ItMDJmMy00OTBjLTk4ZGItNDBhNDBkYTg1OTU1IiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNjg1NzM2NDg3LCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiZDRkNTBiNWQtMjNhYy00YzE2LWIwNjYtNTc1ZDRhYTkwNDgxIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5In0.Py6WEoaXXyrYDkZiAsozcOPq0J62W9hTH60ebjFVQIEBDNBADRyEfZf08hOAykv07Q2nTj6MoGdmQQHkj5gbNRxkcxga_PyRedb-7fwiHmYt9BHLI9t3gaNG4UuI3eLtMJdWfF2PtF1FCro0RNSJkJ8HXM3QMb_8z47TE35DS7CcOXeeYS6qF8Ie5rPS-sYAK1-NC-D_C5mYvfrG5NuCgAKYZJ7DGGciZcnL0__QwBq595SKXb1-fMJfL8v_19goLkGgaf8ToSVK_FXKLK6vzqqrgUkiYOMqAKssDAzYa0sNVvkK4RvdG1kLdZeI1tKsHyOoNkNLgDS30FxO66q1nw'
let country = 'US'
let abck = 'D272A5DF7CD3D7298A7DB8492F4CB3C5~-1~YAAQFFLbF/tl0ZeIAQAA20nXngrOjxYqRKgNCboF6d66yPv4t8j0gzm4IOUwBkYO5JGBncZQV3KgPmGiRU95rhgyHBGZAiHx+fQBuAZoZlpqJL54d8/06yGI7gUGiVjEYiewptmrpb+I7RQ2AN6ZIdiMLcvaylqUUCdWPWwYL/8YoTuCUODjqpTmln29tewQBlElvQgUX581bO0P0UkRQ9NjB+dfDDubc2ta0eVFChUhpu8vgQbOznF7iBXsKXUpS6UKneY65b1XbGcnfV6XhPbiarm2HHXwSD7qII228a+aC7Elxk/1kawkc5gU4mF8qMnLD+fjhfRGQH76MA+4x1Lmlm3JtcN90zHpAtvAXLdVrKNVVyZ7kB4RUsGZbqRLFP9M0BTr4L49UNstjq9RRBET419ziEP2hBc10GCCrQSCDwNBuWTNmJY1rUg/cFDeud2rLDKtgQ8PuxsyBmAgDQhdW/X4GveGLQ1kv+G4NruxLrEdwOXJQtyHS8lIiDkAoQoPLIfI9+p4P37f+64pmyfCMIWQozk=~-1~-1~-1; Domain=.nike.com; Path=/; Expires=Sat, 08 Jun 2024 06:28:07 GMT; Max-Age=31535998; Secure'
nikeatc(pid, bearer, country)
async function nikeatc(pid, bearer, country) {
  country = country.toUpperCase()
  function createUnsafeUUID() {
    let dt = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }
  console.log(JSON.stringify({
    pid,
    country,
  }))
  let r1 = await fetch(
    `https://api.nike.com/buy/carts/v2/${country}/NIKE/NIKECOM?modifiers=VALIDATELIMITS,VALIDATEAVAILABILITY`,
    {
      headers: {
        'user-agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)',
        //'X-FORWARDED-FOR': '',
        'accept': 'application/json',
        'accept-language': 'en-US,en;q=0.9',
        'appid': 'com.nike.commerce.nikedotcom.web',
        'authorization': `Bearer ${bearer}`,
        'cache-control': 'no-cache',
        'content-type': 'application/json; charset=UTF-8',
        'pragma': 'no-cache',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'x-b3-spanname': 'CiCCart',
        'x-b3-traceid': createUnsafeUUID(),
        'cookie': `optimizelyEndUserId=oeu1686050796977r0.9170443286285725; s_ecid=MCMID%7C36230533128066856717225098904178209188; AMCV_F0935E09512D2C270A490D4D%40AdobeOrg=1994364360%7CMCMID%7C36230533128066856717225098904178209188%7CMCAID%7CNONE%7CMCOPTOUT-1686057997s%7CNONE%7CvVersion%7C3.4.0; anonymousId=DSWX2DE07D5F83D30CD4A366D5FFA0049A1F; AnalysisUserId=23.54.64.76.1920821686051092806; _gcl_au=1.1.2028333528.1686051096; _rdt_uuid=1686051096061.c170909e-ec5b-4bdf-9b4a-15713a72500e; _fbp=fb.1.1686051096311.1592634552; _scid=00c21c4b-5d3f-41f2-83b5-7769373af9e7; _tt_enable_cookie=1; _ttp=qJ65o2fBiZUNylM3gn46jyZHOUb; guidS=6468e0f4-ecc5-411f-95b4-dbb8de1c7ce4; guidU=030aedd5-f153-479e-8d93-dc3a4cc369eb; NIKE_COMMERCE_COUNTRY=US; NIKE_COMMERCE_LANG_LOCALE=en_US; RES_TRACKINGID=940963329719255; ResonanceSegment=1; cid=undefined%7Cundefined; CONSUMERCHOICE=us/en_us; pixlee_analytics_cookie=%7B%22CURRENT_PIXLEE_USER_ID%22%3A%229ab95b80-f1e9-e126-440d-de6367468d3c%22%7D; pixlee_analytics_cookie_legacy=%7B%22CURRENT_PIXLEE_USER_ID%22%3A%229ab95b80-f1e9-e126-440d-de6367468d3c%22%7D; _gac_UA-167630499-2=1.1686198062.CjwKCAjw1YCkBhAOEiwA5aN4ARv-Sy3F_fhFCLoU33py4FP9K-6WXH4BFlB6b3GylKMSY7_0SHKIJxoCnyQQAvD_BwE; _gcl_aw=GCL.1686198069.CjwKCAjw1YCkBhAOEiwA5aN4ARv-Sy3F_fhFCLoU33py4FP9K-6WXH4BFlB6b3GylKMSY7_0SHKIJxoCnyQQAvD_BwE; _gcl_dc=GCL.1686198069.CjwKCAjw1YCkBhAOEiwA5aN4ARv-Sy3F_fhFCLoU33py4FP9K-6WXH4BFlB6b3GylKMSY7_0SHKIJxoCnyQQAvD_BwE; forterToken=f17d756dff594c26877f15448c801649_1686198069933__UDF43-m4_13ck; geoloc=cc=US,rc=NY,tp=vhigh,tz=EST,la=40.8044,lo=-73.641; AKA_A2=A; at_check=true; bm_sz=4281E1CC17C474CED082F8BA42F1E3D1~YAAQLZUzuGjjzpWIAQAA6t/CnhQ8Td68OmtXNhk0fDvXW27BXklUzZXed16Ng2/uPKqQ0sBcATi8f194oroPyAShqRdUcHOb/QKcjvJtwhPFQX7B2d8mCwIfUjgylaVNQaNbEnG6bp8TvzncBkCcHcTGZwXxQURdTLtJkTSBrgsXDW/yAVysL1g1kvQTK3itfRDfcqmvlck+MK6rclNOhglV7oIMOx0RWNwul+eGm9YuX0v2OAqzTt7HOTFQ7oBKiYb4vI6n5/z4Zp1K5MQ3D5v4qhIBAF0nRONMX2oElqH1IRZhheESHo65//+DlHyU90nOUZ194vhqgEjuBTbMsxd4Hm2SeOnIKT8Kk/MjHLW3/WkYSo22OhmhJYwtsjQXa5zt5ElGe5jxYb4pug==~3753538~3616835; bm_mi=9EC453952CC8C78E2F7AAC832857678C~YAAQt3lGaBzpm4CIAQAAQOHCnhRwYIdpcLodogg0Ss19dV3L0b32JbngoyhPPAH5ZFzF/IvGscunu0wyjte5R0kiuy6EmXmUOqZ8zXtzwPb6wGbV7Ijp4vURZzBoPpMCM6G329ulG2CB8U9mTOX24YpN5RZ16xwbHhczbjDX4Fmx3iSvHxMKjolOE5kh6SShwJlzRg2eejHQlUUXkMa58oixLABf5BEipCGceEFLW0mzirE+cqUlhHpjyAroV4iIjOJwjeBeG0ZweJ25ztgdRltokKF7CEAmyeFQLHPxy4SHikGny59s2WQXNBn9wDriuGCCE2H8oQ==~1; ak_bmsc=7365B6DA297BBE51176C2A0A5B4B4C6A~000000000000000000000000000000~YAAQt3lGaDnpm4CIAQAA6uXCnhRLz/j3zVdg20y0gAMIjQPWpFhadz3GriK2ws3hd0vJqmhGNFoFjMSs1NEaMPKYgdZqEFHIdDE+FCNMTRoMoc2AF+lRnMyetrbje6RknjjqQsCx/im/368k5DR4kywjYZfEjSgAr4J9OIFI1K1J/1ieWB61Yu+fFJC6iNHKFdq97O78b9hfhK1TQEnf5UC6Xpla499SiuDtuG0amSbiP+FqVZQsOcnGgN1YJx0JgyegffjqBx9yWtRePA2CmluZ8Q3mgSZKQX1FUZZ14+wFGqi6zxaLVrvgi1m42ZqiXRT837X4VWLK4TENiV2T8oIUV58hKcFSY2IWtldVqbh+gE9zgf/Nzw8eN3j4utksN78hMSqdlCJrGFg+BMZyvrGZW8Uzv/OuZzQsBvwF4XklyCGOaoipX67N1GgnGpkqDpsG2rHB8vR2qbyLhXt20JLS5ChO0UsJWZ0oKyMMpb0HNHtq39NICk8QCq7xh7DKeZVD3GkU35Ey; mbox=PC#a47fc5d7a95945a2a01276cea5be759b.34_0#1749535556|session#6d14b9bc4b644b42a8f36c6a1f9ba252#1686292616; _gid=GA1.2.1057305252.1686290756; _screload=1; audience_segmentation_performed=true; RES_SESSIONID=526963287621294; ppd=pdp|nikecom>pdp>nike%20air%20max%2090; RT="z=1&dm=nike.com&si=9a8d68c1-506a-4794-9d63-c1514bc3be4a&ss=lio5z2ny&sl=9&tt=nrh&bcn=%2F%2F173bf106.akstat.io%2F&ld=piyd"; ak_bmsc_nke-2.3-ssn=0goiar3y5yFVtNuYm5XCwGAjonUWsRMWpnwVpl9eqJ7TUtyxZGko5UPDZLji1l5GOiggUwpSnLl32FPUohlFE2wzPsoMYlIojXrd05ouTTmKBORaTCM6nbIapvudyQOSidLfc4Gycyxu3x4MkT9enCjEZaEH; ak_bmsc_nke-2.3=0goiar3y5yFVtNuYm5XCwGAjonUWsRMWpnwVpl9eqJ7TUtyxZGko5UPDZLji1l5GOiggUwpSnLl32FPUohlFE2wzPsoMYlIojXrd05ouTTmKBORaTCM6nbIapvudyQOSidLfc4Gycyxu3x4MkT9enCjEZaEH; _scid_r=00c21c4b-5d3f-41f2-83b5-7769373af9e7; cto_bundle=7-wPGV9TcFhZdHhQNjF0T2o4c2lJaVlrJTJGcTVpUkZyNEs4VWhkRDhSclU2Q1FTQTFlV0E0RUlJdDFYUmFyTE9wVVp1SVJZZ3ZKWTZXJTJCYlIlMkZTNHBEeDRuY0NhVFBybVNiYWViaGEySTdkZWNhbFpFTklwMHdhbWd1JTJCRTlodVFleUlBUVVxdmczcWptdkoyM1dpRkF3ek5sMnZMQSUzRCUzRA; _ga=GA1.2.737248998.1686051096; _gat_UA-167630499-2=1; _ga_QTVTHYLBQS=GS1.1.1686290756.26.1.1686292082.60.0.0; bm_sv=A7C8BB4FF6A3BE92AF4B709220D3BE0C~YAAQDpUzuJwddpKIAQAAoyvXnhRS+vp15nWrbSIfAuSsjFAGh8Ol6lj+sq+U81H09ChCiH19tIsgZi50Kefy/o47VVJNAqpdiNHX++TTh2IVmmdcpG+4MvpZ3ajV49FIEQEsoEnTnOG8mYKkWET4sqk/FMCjGlwxDw5IHMce1rNw0CbxmmUUD8gMVr26/2mhP86VAheXLirq62QfEwX1BnxnvuWJcelF4QW1F07BGB39UALMatUbY3rqJ+KGFys=~1; bc_nike_triggermail=%7B%22distinct_id%22%3A%20%22188907a060dc96-0b7220ea9b93e2-26031d51-384000-188907a060e185e%22%2C%22bc_persist_updated%22%3A%201686292088319%2C%22bc_id%22%3A%201792049462%2C%22bluecoreSiteIsMember%22%3A%20true%2C%22g_search_engine%22%3A%20%22google%22%2C%22last_carted_product%22%3A%20%2212789178%22%7D; _abck=D272A5DF7CD3D7298A7DB8492F4CB3C5~-1~YAAQLZUzuOWOz5WIAQAAMUTXngoMGFfFxU5fsHKGalClBFozl0Qb0M4y2WZjcZ/WFIebzwuNMWTqmMj1I6dcZhJvAkUMV3vLIX50OHYNeCbxGkskUkvtOqwU6DATXQaEVzZaqoB5NlosWFd29wN5XkANsCPqbKL2WD906kiw8KpWVDbW+nq38YR9ZW6F2nXQ5Xad403hURFOvGUymwlBVN3m+lWlrdt3O/SYhX2k2PioXKel8KxPZCYjfsSN/KuWMv6i69MiUKXkTT0M3QL6WuFgsdgIXepP4ry9DojG+jyz5orns5tIM3885/6+oPvw0tLXfDXPwThJABAx9W/aUfCODRSj4CuMqTVC2yg48+sLoPJQF3hT+FG3PECJLZ4HjPgH0dML+yKs9pzfV38rUGXRBwxBK5WKju1S9JYBqPM5vTC01CQF5c6b6NzZmZQXyMDizYS3HWdM0sYh0n4rdTb3/O8G/xjPXzWXLMcnUu7ffUXsa2iYZyKI3quZpewT1dT1suF/m0ymmAMLKduGDGIQh+mT1Kw=~-1~-1~-1`,
      },
      referrerPolicy: 'no-referrer-when-downgrade',
      body: `[{"op":"add","path":"/items","value":{"itemData":{"url":"/t/air-max-90-mens-shoes-6n3vKB/CN8490-100"},"skuId":"${pid}","quantity":1}}]`,
      method: 'PATCH',
      mode: 'cors',
    },
  );
  let r3 = await r1.text()
  console.log(r3)

}