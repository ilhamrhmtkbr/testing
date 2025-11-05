for name in forum instructor student user public; do
  rm -rf backend-api-${name}/composer.lock
done