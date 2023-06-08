#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;

uniform float _medThreshold;
uniform float _medSmooth;
uniform float  _shadowThreshold;
uniform float  _shadowSmooth;
uniform float _reflectThreshold;
uniform float _reflectSmooth;

uniform vec3 _medColor;
uniform vec3 _shadowColor;
uniform vec3 _reflectColor;



varying vec3 vNormal;
varying vec3 vViewDir;

float LinearStep(float minValue, float maxValue, float In)
{
  return saturate((In-minValue) / (maxValue - minValue));
}

void main() {

  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vDirectionalShadowCoord[0]
  );

  float NdotL = dot(vNormal, directionalLights[0].direction);
  float lightIntensity =max((NdotL),0.0) *0.5+0.5;
  float shadowIntensity =max((NdotL*shadow),0.0);
  //float shadowIntensity =max((NdotL*shadow),0.0) *0.5+0.5;

  float smoothMedTone = LinearStep(_medThreshold - _medSmooth, _medThreshold + _medSmooth, lightIntensity);
  vec3 medToneColor = mix(_medColor, vec3(1.0),vec3(smoothMedTone));


  float smoothShadow = LinearStep(_shadowThreshold - _shadowSmooth, _shadowThreshold + _shadowSmooth, lightIntensity);
  vec3 shadowColor = mix(_shadowColor, medToneColor, smoothShadow * vec3(shadowIntensity));


  float smoothReflect = LinearStep(_reflectThreshold - _reflectSmooth, _reflectThreshold + _reflectSmooth, lightIntensity);
  vec3 refectColr = mix(_reflectColor, shadowColor, smoothReflect);

  vec3 directionalLight = directionalLights[0].color * refectColr;

  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  float specularIntensity = pow(NdotH * lightIntensity, 100.0 / uGlossiness);
  float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensity * vec3(1.0,1.0,1.0);
  
   gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor + specular), 1.0);
}