#include <common>
#include <lights_pars_begin>

uniform vec3 uColor;
uniform float uGlossiness;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float NdotL = dot(vNormal, directionalLights[0].direction);
  float lightIntensity = NdotL;
  vec3 directionalLight = directionalLights[0].color * lightIntensity;

  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  float specularIntensity = pow(NdotH * lightIntensity, 50.0 / uGlossiness);
  float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensity * vec3(1.0,1.0,1.0);
  
   gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor + specular), 1.0);
}