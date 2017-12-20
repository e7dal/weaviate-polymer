ROOTKEY=$(docker exec -it weaviate cat /var/weaviate/first_run.log|grep -s ROOTKEY|sed 's/.*ROOTKEY=//')"
echo $ROOTKEY
curl -v -H \"X-API-KEY:$cat ROOTKEY.TXT" -X GET "http://127.0.0.1:8070/weaviate/v1/meta" -H  "accept: application/json" 
  
